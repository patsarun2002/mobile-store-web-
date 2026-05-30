// Error message mapping utility
export const getErrorMessage = (error: any): string => {
  const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
  
  // Handle Zod validation errors
  if (error?.response?.data?.errors && Array.isArray(error?.response?.data?.errors)) {
    const firstError = error.response.data.errors[0];
    if (firstError?.message) {
      return mapValidationMessage(firstError.message);
    }
    return "กรอกข้อมูลไม่ครบถ้วน";
  }

  // Map API error messages to Thai
  if (apiMessage) {
    return mapApiMessage(apiMessage);
  }

  // Default error
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
};

const mapApiMessage = (message: string): string => {
  const errorMap: Record<string, string> = {
    "User not found": "ไม่พบผู้ใช้งาน",
    "Invalid credentials": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    "Access denied": "ไม่มีสิทธิ์เข้าถึง",
    "Cannot change user level": "ไม่สามารถเปลี่ยนระดับผู้ใช้ได้",
    "Product not found": "ไม่พบสินค้า",
    "Quantity exceeds limit": "จำนวนเกินกำหนด",
    "Database operation failed": "ข้อผิดพลาดฐานข้อมูล",
    "Internal server error": "เกิดข้อผิดพลาดในระบบ",
    "Password must contain at least one uppercase letter, one lowercase letter, and one number": "รหัสผ่านต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลขอย่างน้อย 1 ตัว",
  };

  return errorMap[message] || message;
};

const mapValidationMessage = (message: string): string => {
  const validationMap: Record<string, string> = {
    "Required": "กรุณากรอกข้อมูลให้ครบถ้วน",
    "Too small": "ข้อมูลไม่ครบถ้วน",
    "Too big": "ข้อมูลเกินกำหนด",
    "Invalid email": "รูปแบบอีเมลไม่ถูกต้อง",
    "Invalid": "ข้อมูลไม่ถูกต้อง",
  };

  // Check if message contains any of the validation keys
  for (const [key, thaiMessage] of Object.entries(validationMap)) {
    if (message.includes(key)) {
      return thaiMessage;
    }
  }

  return message;
};

export const showErrorAlert = async (error: any) => {
  const message = getErrorMessage(error);
  const Swal = (await import('sweetalert2')).default;
  
  await Swal.fire({
    icon: 'error',
    title: 'เกิดข้อผิดพลาด',
    text: message,
    timer: 2000,
  });
};
