import { userRepository } from "../repositories/user.repository";

export const userService = {
  getUsers: async () => {
    return userRepository.findAll();
  },
};