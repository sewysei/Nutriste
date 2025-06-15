import { UserModel } from "../../models/users.js";

export const deleteUser = async (req, res) => {
  const email = req.body;

  try {
    const selectedUser = UserModel.findOneAndDelete({ email });
    res.status(200).json({
      status: "Success",
      message: "Berhasil delete ",
      selectedUser,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
