import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export interface BackButtonHandler {
  canHandle: () => boolean;
  handle: () => void;
}

class NativeService {
  private handlers: BackButtonHandler[] = [];
  private isInitialized = false;

  async init() {
    if (!Capacitor.isNativePlatform()) return;
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // Cấu hình Status Bar theo giao diện Dark Fintech của App
      await StatusBar.setStyle({ style: Style.Dark });
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#090d16' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      }
    } catch (e) {
      console.warn('Không thể khởi tạo StatusBar:', e);
    }

    // Lắng nghe sự kiện nút Back cứng / cử chỉ vuốt Back trên Android
    CapApp.addListener('backButton', ({ canGoBack }) => {
      // Duyệt qua các handler theo thứ tự ưu tiên (LIFO - từ trên xuống)
      for (let i = this.handlers.length - 1; i >= 0; i--) {
        const handler = this.handlers[i];
        if (handler.canHandle()) {
          handler.handle();
          return;
        }
      }

      // Nếu không có modal hay sub-screen nào mở và ở màn hình chính
      if (!canGoBack) {
        CapApp.exitApp();
      }
    });
  }

  registerBackButtonHandler(handler: BackButtonHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }
}

export const nativeService = new NativeService();
