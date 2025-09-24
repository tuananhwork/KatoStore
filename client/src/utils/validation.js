import { VALIDATION } from './constants';

export const validators = {
  email: (email) => {
    if (!email?.trim()) return 'Vui lòng nhập email';
    if (!VALIDATION.EMAIL_REGEX.test(email)) return 'Email không hợp lệ';
    return null;
  },

  password: (password) => {
    if (!password?.trim()) return 'Vui lòng nhập mật khẩu';
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH)
      return `Mật khẩu tối thiểu ${VALIDATION.PASSWORD_MIN_LENGTH} ký tự`;
    return null;
  },

  phone: (phone) => {
    if (!phone?.trim()) return 'Vui lòng nhập số điện thoại';
    if (!VALIDATION.PHONE_REGEX.test(phone.replace(/\s/g, ''))) return 'Số điện thoại không hợp lệ';
    return null;
  },

  required: (value, fieldName) => {
    if (!value?.trim()) return `Vui lòng nhập ${fieldName}`;
    return null;
  },

  confirmPassword: (password, confirmPassword) => {
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return null;
  },
};

export const validateForm = (data, rules) => {
  for (const [field, rule] of Object.entries(rules)) {
    const error = rule(data[field], data);
    if (error) return { field, error };
  }
  return null;
};
