// Hàm validate email sử dụng regex đơn giản
export const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email) // Kiểm tra có @ và . với ký tự không phải khoảng trắng
}