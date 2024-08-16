import Account from "../../models/User/Account/Account.js";
import User from "../../models/User/User.js";

export const createAccount = async (userId, role) => {
  try {
    const account = Account.create({
      userId,
      role,
    });
    return account;
  } catch (error) {
    return false;
  }
};

export const setAccountDefaultInUser = async (userId, accountId) => {
  try {
    const user = await User.findByPk(userId);
    if (user.account_default) return false;
    await user.update({ account_default: accountId });
    return accountId;
  } catch (error) {
    return false;
  }
};
