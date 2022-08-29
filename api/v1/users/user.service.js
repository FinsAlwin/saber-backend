const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../../../config/db");
const User = require("../../../model/user.model");
const Connections = require("../../../model/connections.model");
const Accounts = require("../../../model/accounts.model");
const Transactions = require("../../../model/transactions.model");
const axios = require("axios");
require("dotenv").config();
const { validateEmailAndUsername } = require("./user.helper");
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} = require("../../../utils/api_error_util");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;

const generateJwtToken = (id, password, username) => {
  return jwt.sign(
    {
      id,
      password,
      username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const register = async (params) => {
  const data = params.body;

  const otpKey = process.env.TWO_FACTOR_API_KEY;

  const OTP = Math.floor(1000 + Math.random() * 9000);

  const otpUrl = `https://2factor.in/API/V1/${otpKey}/SMS/${
    data.countryCode + data.mobile
  }/${OTP}`;

  await validateEmailAndUsername(data.email, data.username, data.mobile);

  const passwordHashC = await bcrypt.hash(data.password, 10);

  const user = new User({
    email: data.email,
    countryCode: data.countryCode,
    mobile: data.mobile,
    username: data.username,
    passwordHash: passwordHashC,
    firstName: data.firstName,
    lastName: data.lastName,
    otp: OTP,
  });

  try {
    await Promise.all([user.save(), getOtp(otpUrl)]);

    return {
      data: {
        user: {
          userId: user.id,
          username: user.username,
        },
      },
      statusCode: 201,
      message: "Registration completed successfully",
    };
  } catch (error) {
    return { statusCode: 400, message: error.message };
  }
};

const signin = async ({ body }) => {
  const user = await User.findOne({
    username: body.username,
    isVerified: true,
  });

  if (!user) {
    throw new BadRequestError(
      "User with this Username could not be found....."
    );
  }

  if (user.isVerified === false) {
    throw new BadRequestError("Your account is not verified.");
  }

  const isEqual = await bcrypt.compare(body.password, user.passwordHash);

  if (!isEqual) {
    throw new BadRequestError("Wrong password!");
  }

  user.save();

  const token = generateJwtToken(user.id, user.passwordHash, user.username);

  const {
    id,
    email,
    firstName,
    lastName,
    username,
    countryCode,
    mobile,
    isVerified,
    isConnected,
  } = user;

  return {
    statusCode: 200,
    token,
    user: {
      id,
      email,
      firstName,
      lastName,
      username,
      countryCode,
      mobile,
      isVerified,
      isConnected,
    },
  };
};

const verifyMobileOtp = async ({ body }) => {
  const { otp, userId } = body;

  if (!otp) {
    throw new BadRequestError("OTP is required");
  }

  const _user = await User.findById(userId);

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  if (otp === _user.otp) {
    const token = generateJwtToken(
      _user.id,
      _user.passwordHash,
      _user.username
    );

    const updateData = { isVerified: 1 };
    const options = { new: true };

    await User.findByIdAndUpdate(userId, updateData, options);

    const UserData = await User.findById(userId);

    const {
      id,
      email,
      firstName,
      lastName,
      username,
      countryCode,
      mobile,
      isVerified,
    } = UserData;

    return {
      statusCode: 200,
      message: "Mobile Number verified successfully.",
      data: {
        token,
        user: {
          id,
          email,
          firstName,
          lastName,
          username,
          countryCode,
          mobile,
          isVerified,
        },
      },
    };
  } else {
    throw new BadRequestError("Something went wrong.");
  }
};

const connect = async ({ body }) => {
  const { userId } = body;
  const appID = process.env.SALT_EDGE_APP_ID;
  const secret = process.env.SALT_EDGE_SECRET;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  const _user = await User.findById(userId);

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const { id, email, customerIdSaltEdge, customerSecretSaltEdge } = _user;

  if (!customerIdSaltEdge && !customerSecretSaltEdge) {
    const createCus = await createCustomer(email, appID, secret);

    const updateData = {
      customerIdSaltEdge: createCus.data.data.id,
      customerSecretSaltEdge: createCus.data.data.secret,
    };
    const options = { new: true };

    await User.findByIdAndUpdate(id, updateData, options);

    const connSession = await connectSessions(
      createCus.data.data.id,
      appID,
      secret
    );

    return {
      statusCode: 200,
      data: connSession.data.data,
      message: "Success",
    };
  } else {
    const connSession = await connectSessions(
      customerIdSaltEdge,
      appID,
      secret
    );

    return {
      statusCode: 200,
      data: connSession.data.data,
      message: "Success",
    };
  }
};

const showConnection = async ({ body }) => {
  const { userId, connection_id } = body;
  const appID = process.env.SALT_EDGE_APP_ID;
  const secret = process.env.SALT_EDGE_SECRET;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  if (!connection_id) {
    throw new BadRequestError("Connection Id is required");
  }

  const _user = await User.findById(userId);

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const getConnectionDetails = await showConnectionDetail(
    connection_id,
    appID,
    secret
  );

  const saveConnectionDB = await saveConnection(
    getConnectionDetails.data.data,
    connection_id,
    userId
  );

  const data = await getDataConnection(saveConnectionDB.userId);

  const accountList = await getAccountList(connection_id, appID, secret);

  const test = await saveAccount(accountList.data.data, userId);

  console.log(saveConnectionDB);
  return {
    statusCode: 200,
    data: data,
    message: "Success",
  };
};

const listConnection = async ({ body }) => {
  const { userId } = body;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  const _user = await User.findById(userId);

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const connection = await Connections.find({
    userId: userId,
  });

  if (connection.length === 0) {
    throw new NotFoundError("Connection not found");
  }

  return {
    statusCode: 200,
    message: "Connection list",
    data: connection,
  };
};

const listAccounts = async ({ body }) => {
  const { userId, connection_id } = body;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  if (!connection_id) {
    throw new BadRequestError("Connection Id is required");
  }

  const _user = await User.findById(userId);

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const accounts = await Accounts.find({
    userId: userId,
    connection_id: connection_id,
  });

  if (accounts.length === 0) {
    throw new NotFoundError("Account not found");
  }

  return {
    statusCode: 200,
    message: "Accounts list",
    data: accounts,
  };
};

const transactions = async ({ body }) => {
  const { userId, account_id, connection_id } = body;
  const appID = process.env.SALT_EDGE_APP_ID;
  const secret = process.env.SALT_EDGE_SECRET;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  const _user = await User.findById(userId);

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const transactions = await getTransactionsList(
    connection_id,
    account_id,
    appID,
    secret
  );

  const saveData = await saveTransactions(
    transactions.data.data,
    userId,
    connection_id
  );

  const transactionsData = await Transactions.find({
    userId: userId,
    account_id: account_id,
  });

  if (transactionsData.length === 0) {
    throw new NotFoundError("Account not found");
  }

  return {
    statusCode: 200,
    data: transactionsData,
    message: "Success",
  };
};

const getTransactions = async ({ body }) => {
  const { userId } = body;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  const _user = await User.findById(userId);

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const transactions = await Transactions.find({
    userId: userId,
  });

  if (transactions.length === 0) {
    throw new NotFoundError("Transactions not found");
  }

  return {
    statusCode: 200,
    message: "Transactions list",
    data: transactions,
  };
};

const updateAccounts = async ({ body }) => {
  const { userId, connection_id } = body;
  const appID = process.env.SALT_EDGE_APP_ID;
  const secret = process.env.SALT_EDGE_SECRET;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  if (!connection_id) {
    throw new BadRequestError("Connection Id is required");
  }

  const _user = await db.User.findOne({
    where: {
      id: userId,
    },
  });

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const accountList = await getAccountList(connection_id, appID, secret);

  const Accountdata = accountList.data.data;

  await saveAccount(Accountdata, userId);

  const accounts = await db.Accounts.findAll({
    where: {
      userId: userId,
      connection_id: connection_id,
    },
  });

  return {
    statusCode: 200,
    data: accounts,
    message: "Success",
  };
};

const updateTransactions = async ({ body }) => {
  const { userId, account_id, connection_id } = body;
  const appID = process.env.SALT_EDGE_APP_ID;
  const secret = process.env.SALT_EDGE_SECRET;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  if (!connection_id) {
    throw new BadRequestError("Connection Id is required");
  }

  if (!account_id) {
    throw new BadRequestError("Account Id is required");
  }

  const _user = await db.User.findOne({
    where: {
      id: userId,
    },
  });

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const transactiontList = await getTransactionsList(
    connection_id,
    account_id,
    appID,
    secret
  );

  const Transactiondata = transactiontList.data.data;

  try {
    await saveTransactions(Transactiondata, userId, connection_id);
  } catch (err) {
    console.log(err);
  }

  const transactions = await db.Accounts.findAll({
    where: {
      userId: userId,
      account_id: account_id,
    },
  });

  return {
    statusCode: 200,
    data: transactions,
    message: "Success",
  };
};

const listUserCategory = async ({ body }) => {
  const { userId } = body;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  const _user = await db.User.findOne({
    where: {
      id: userId,
    },
  });

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const category = await db.UserCategory.findAll({
    where: {
      userId: userId,
    },
  });

  if (category.length === 0) {
    throw new NotFoundError("Category not found");
  }

  return {
    statusCode: 200,
    message: "Users Category list",
    data: category,
  };
};

const addUserCategory = async ({ body }) => {
  const { userId, category_title } = body;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  const _user = await db.User.findOne({
    where: {
      id: userId,
    },
  });

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  const category = await db.UserCategory.findAll({
    where: {
      userId: userId,
      title: category_title,
    },
  });

  const saltCategory = await db.CategorySaltEdge.findAll({
    where: {
      title: category_title,
    },
  });

  const saltSubCategory = await db.SubCategorySaltEdge.findAll({
    where: {
      title: category_title,
    },
  });

  if (
    category.length !== 0 ||
    saltSubCategory.length !== 0 ||
    saltCategory.length !== 0
  ) {
    throw new NotFoundError("Category Already Exists");
  }

  await db.UserCategory.create({
    userId: userId,
    title: category_title,
  });

  const categoryData = await db.UserCategory.findAll({
    where: {
      userId: userId,
    },
  });

  return {
    statusCode: 200,
    data: categoryData,
    message: "Category Added Successfully.",
  };
};

const updateUserCategory = async ({ body }) => {
  const { userId, category_id, new_title } = body;

  if (!userId) {
    throw new BadRequestError("User Id is required");
  }

  const _user = await db.User.findOne({
    where: {
      id: userId,
    },
  });

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  await db.UserCategory.update(
    {
      title: new_title,
    },
    {
      where: {
        id: category_id,
      },
    }
  );

  const category = await db.UserCategory.findAll({
    where: {
      userId: userId,
    },
  });

  return {
    statusCode: 200,
    data: category,
    message: "Category Added Successfully.",
  };
};

const deleteUserCategory = async ({ body }) => {
  const { category_id, userId } = body;

  const _user = await db.User.findOne({
    where: {
      id: userId,
    },
  });

  if (!_user) {
    throw new NotFoundError("User not found");
  }

  await db.UserCategory.destroy({
    where: {
      id: category_id,
    },
  });

  const category = await db.UserCategory.findAll({
    where: {
      userId: userId,
    },
  });

  return { statusCode: 200, data: category, message: "Deleted successfuly" };
};

const testConnection = async ({ body }) => {
  const { userId, connection_id } = body;

  const vaild = ObjectId.isValid(userId);

  return {
    statusCode: 200,
    data: ObjectId(userId),
    message: "Success",
  };
};

module.exports = {
  register,
  signin,
  verifyMobileOtp,
  connect,
  listConnection,
  showConnection,
  testConnection,
  listAccounts,
  transactions,
  getTransactions,
  updateAccounts,
  updateTransactions,
  listUserCategory,
  addUserCategory,
  updateUserCategory,
  deleteUserCategory,
};

async function getOtp(otp) {
  try {
    const response = await axios.get(otp);
  } catch (error) {}
}

async function createCustomer(email, appID, secret) {
  return await axios.post(
    "https://www.saltedge.com/api/v5/customers/",
    {
      data: {
        identifier: email,
      },
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": `${appID}`,
        Secret: `${secret}`,
      },
    }
  );
}

async function connectSessions(customerIdSaltEdge, appID, secret) {
  return await axios.post(
    "https://www.saltedge.com/api/v5/connect_sessions/create",
    {
      data: {
        customer_id: customerIdSaltEdge,
        return_connection_id: true,
        consent: {
          scopes: ["account_details", "transactions_details"],
        },
        attempt: {
          fetch_scopes: ["accounts", "transactions"],
        },
      },
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": `${appID}`,
        Secret: `${secret}`,
      },
    }
  );
}

async function showConnectionDetail(connection_id, appID, secret) {
  return axios.get(
    `https://www.saltedge.com/api/v5/connections/${connection_id}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": `${appID}`,
        Secret: `${secret}`,
      },
    }
  );
}

async function saveConnection(item, connection_id, userId) {
  try {
    const isConnection = await Connections.findOne({
      connection_id: connection_id,
    });

    if (!isConnection) {
      const save = new Connections({
        connection_id: connection_id,
        userId: userId,
        customer_id: item.customer_id,
        secret: item.secret,
        provider_id: item.provider_id,
        provider_code: item.provider_code,
        provider_name: item.provider_name,
        status: item.status,
        categorization: item.categorization,
        country_code: item.country_code,
      });

      save.save();

      return save;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}

async function getDataConnection(userId) {
  return await Connections.find({
    userId: userId,
  });
}

async function getAccountList(connection_id, appID, secret) {
  return axios.get(
    `https://www.saltedge.com/api/v5/accounts?connection_id=${connection_id}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": `${appID}`,
        Secret: `${secret}`,
      },
    }
  );
}

async function saveAccount(data, userId) {
  const save = await data.forEach(async (item) => {
    const _accounts = await Accounts.findOne({ account_id: item.id });

    if (_accounts) {
      const updateData = {
        balance: item.balance,
        extra_bban: item.extra.bban && item.extra.bban,
        extra_iban: item.extra.iban && item.extra.iban,
        extra_sort_code: item.extra.sort_code && item.extra.sort_code,
        extra_client_name: item.extra.client_name && item.extra.client_name,
        extra_transactions_count_posted:
          item.extra.transactions_count.posted &&
          item.extra.transactions_count.posted,
        extra_transactions_count_pending:
          item.extra.transactions_count.pending &&
          item.extra.transactions_count.pending,
        extra_last_posted_transaction_id:
          item.extra.last_posted_transaction_id &&
          item.extra.last_posted_transaction_id,
        extra_status: item.extra.status && item.extra.status,
        extra_card_type: item.extra.card_type && item.extra.card_type,
        extra_expiry_date: item.extra.expiry_date && item.extra.expiry_date,
        extra_account_name: item.extra.account_name && item.extra.account_name,
        extra_credit_limit: item.extra.credit_limit && item.extra.credit_limit,
        extra_blocked_amount:
          item.extra.blocked_amount && item.extra.blocked_amount,
        extra_closing_balance:
          item.extra.closing_balance && item.extra.closing_balance,
        extra_available_amount:
          item.extra.available_amount && item.extra.available_amount,
        extra_next_payment_date:
          item.extra.next_payment_date && item.extra.next_payment_date,
        extra_next_payment_amount:
          item.extra.next_payment_amount && item.extra.next_payment_amount,
      };

      const options = { new: true };
      await Accounts.findOneAndUpdate(
        { account_id: item.id },
        updateData,
        options
      );
      return true;
    } else {
      const save = new Accounts({
        account_id: item.id,
        connection_id: item.connection_id,
        customer_id: item.customer_id,
        userId: userId,
        name: item.name,
        nature: item.nature,
        balance: item.balance,
        status: item.status,
        currency_code: item.currency_code,
        extra_bban: item.extra.bban && item.extra.bban,
        extra_iban: item.extra.iban && item.extra.iban,
        extra_sort_code: item.extra.sort_code && item.extra.sort_code,
        extra_client_name: item.extra.client_name && item.extra.client_name,
        extra_transactions_count_posted:
          item.extra.transactions_count.posted &&
          item.extra.transactions_count.posted,
        extra_transactions_count_pending:
          item.extra.transactions_count.pending &&
          item.extra.transactions_count.pending,
        extra_last_posted_transaction_id:
          item.extra.last_posted_transaction_id &&
          item.extra.last_posted_transaction_id,
        extra_status: item.extra.status && item.extra.status,
        extra_card_type: item.extra.card_type && item.extra.card_type,
        extra_expiry_date: item.extra.expiry_date && item.extra.expiry_date,
        extra_account_name: item.extra.account_name && item.extra.account_name,
        extra_credit_limit: item.extra.credit_limit && item.extra.credit_limit,
        extra_blocked_amount:
          item.extra.blocked_amount && item.extra.blocked_amount,
        extra_closing_balance:
          item.extra.closing_balance && item.extra.closing_balance,
        extra_available_amount:
          item.extra.available_amount && item.extra.available_amount,
        extra_next_payment_date:
          item.extra.next_payment_date && item.extra.next_payment_date,
        extra_next_payment_amount:
          item.extra.next_payment_amount && item.extra.next_payment_amount,
      });

      save.save();
      return save;
    }
  });
  return save;
}

async function getTransactionsList(connection_id, account_id, appID, secret) {
  return axios.get(
    `https://www.saltedge.com/api/v5/transactions?connection_id=${connection_id}&account_id=${account_id}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": `${appID}`,
        Secret: `${secret}`,
      },
    }
  );
}

async function saveTransactions(data, userId, connection_id) {
  const save = await data.forEach(async (item) => {
    const _transactions = await Transactions.findOne({
      transactions_id: item.id,
    });

    if (!_transactions) {
      const save = new Transactions({
        account_id: item.account_id,
        transactions_id: item.id,
        connection_id: connection_id,
        userId: userId,
        status: item.status,
        made_on: item.made_on,
        amount: item.amount,
        currency_code: item.currency_code,
        description: item.description,
        category: item.category,
        extra_id: item.extra.id && item.extra.id,
        extra_additional: item.extra.additional && item.extra.additional,
        extra_account_balance_snapshot:
          item.extra.account_balance_snapshot &&
          item.extra.account_balance_snapshot,
        extra_categorization_confidence:
          item.extra.categorization_confidence &&
          item.extra.categorization_confidence,
        extra_posting_date: item.extra.posting_date && item.extra.posting_date,
        extra_account_number:
          item.extra.account_number && item.extra.account_number,
        extra_closing_balance:
          item.extra.closing_balance && item.extra.closing_balance,
        extra_opening_balance:
          item.extra.opening_balance && item.extra.opening_balance,
        extra_transfer_account_name:
          item.extra.transfer_account_name && item.extra.transfer_account_name,
        extra_convert: item.extra.convert && item.extra.convert,
        extra_original_amount:
          item.extra.original_amount && item.extra.original_amount,
        extra_original_currency_code:
          item.extra.original_currency_code &&
          item.extra.original_currency_code,
      });

      save.save();
      return save;
    } else {
      const updateData = {
        extra_id: item.extra.id && item.extra.id,
        extra_additional: item.extra.additional && item.extra.additional,
        extra_account_balance_snapshot:
          item.extra.account_balance_snapshot &&
          item.extra.account_balance_snapshot,
        extra_categorization_confidence:
          item.extra.categorization_confidence &&
          item.extra.categorization_confidence,
        extra_posting_date: item.extra.posting_date && item.extra.posting_date,
        extra_account_number:
          item.extra.account_number && item.extra.account_number,
        extra_closing_balance:
          item.extra.closing_balance && item.extra.closing_balance,
        extra_opening_balance:
          item.extra.opening_balance && item.extra.opening_balance,
        extra_transfer_account_name:
          item.extra.transfer_account_name && item.extra.transfer_account_name,
        extra_convert: item.extra.convert && item.extra.convert,
        extra_original_amount:
          item.extra.original_amount && item.extra.original_amount,
        extra_original_currency_code:
          item.extra.original_currency_code &&
          item.extra.original_currency_code,
      };
      const options = { new: true };
      await Transactions.findOneAndUpdate(
        { transactions_id: item.id },
        updateData,
        options
      );
    }
  });
  return save;
}
