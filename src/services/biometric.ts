import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';

export interface BiometricStatus {
  isAvailable: boolean;
  biometryType: BiometryType;
  title: string;
}

export const biometricService = {
  /**
   * Kiểm tra thiết bị có hỗ trợ cảm biến sinh trắc học (vân tay / khuôn mặt) hay không
   */
  async checkBiometrics(): Promise<BiometricStatus> {
    try {
      const result = await BiometricAuth.checkBiometry();
      let title = 'Vân tay / Sinh trắc học';
      if (
        result.biometryType === BiometryType.faceId ||
        result.biometryType === BiometryType.faceAuthentication
      ) {
        title = 'Nhận diện khuôn mặt';
      } else if (
        result.biometryType === BiometryType.touchId ||
        result.biometryType === BiometryType.fingerprintAuthentication
      ) {
        title = 'Cảm biến vân tay';
      }

      return {
        isAvailable: Boolean(result.isAvailable),
        biometryType: result.biometryType,
        title,
      };
    } catch (e) {
      console.warn('Không thể kiểm tra sinh trắc học:', e);
      return {
        isAvailable: false,
        biometryType: BiometryType.none,
        title: 'Sinh trắc học',
      };
    }
  },

  /**
   * Hiển thị popup quét vân tay / Face ID nguyên bản của hệ điều hành
   */
  async authenticate(reason = 'Xác thực vân tay để mở khóa FinTrack'): Promise<boolean> {
    try {
      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Hủy bỏ',
        androidTitle: 'Xác thực FinTrack',
        androidSubtitle: 'Chạm vào cảm biến vân tay của thiết bị',
        allowDeviceCredential: false,
      });
      return true;
    } catch (e) {
      console.warn('Xác thực sinh trắc học thất bại hoặc người dùng đã hủy:', e);
      return false;
    }
  },
};
