import { userRepository } from "../repositories/user.repository";

export const userService = {
  getUsers: async () => {
    return userRepository.findAll();
  },

  updateUserStatus: async (
    id: number,
    status: "ACTIVE" | "INACTIVE" | "BANNED"
  ) => {
    return userRepository.updateStatus(id, status);
  },
};