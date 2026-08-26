import {
  userRepository,
  type UpdateProfileData,
} from "../repositories/user.repository";

export const userService = {
  getUsers: async () => {
    return userRepository.findAll();
  },

  getUserById: async (id: number) => {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  updateMyProfile: async (id: number, data: UpdateProfileData) => {
    const currentUser = await userRepository.findById(id);

    if (!currentUser) {
      throw new Error("User not found");
    }

    if (data.email) {
      const existingEmailUser = await userRepository.findByEmail(data.email);

      if (existingEmailUser && existingEmailUser.id !== id) {
        throw new Error("Email already exists");
      }
    }

    if (data.phone) {
      const existingPhoneUser = await userRepository.findByPhone(data.phone);

      if (existingPhoneUser && existingPhoneUser.id !== id) {
        throw new Error("Phone already exists");
      }
    }

    return userRepository.updateProfile(id, data);
  },

  updateUserStatus: async (
    id: number,
    status: "ACTIVE" | "INACTIVE" | "BANNED"
  ) => {
    return userRepository.updateStatus(id, status);
  },
};