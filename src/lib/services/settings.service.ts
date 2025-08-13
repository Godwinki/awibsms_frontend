import axiosInstance from "@/lib/axios";

export interface Setting<T = any> {
  key: string;
  value: T;
  description?: string;
}

export class SettingsService {
  static async getAll(section?: string) {
    const url = section ? `/settings?section=${encodeURIComponent(section)}` : "/settings";
    const res = await axiosInstance.get(url);
    return res.data.settings as Setting[];
  }

  static async get<T = any>(key: string, section?: string): Promise<Setting<T> | null> {
    try {
      const url = section ? `/settings/${key}?section=${encodeURIComponent(section)}` : `/settings/${key}`;
      const res = await axiosInstance.get(url);
      return res.data.setting as Setting<T>;
    } catch (err: any) {
      if (err.response && err.response.status === 404) return null;
      throw err;
    }
  }

  static async upsert<T = any>(key: string, value: T, description?: string) {
    const res = await axiosInstance.put(`/settings/${key}`, { value, description });
    return res.data.setting as Setting<T>;
  }

  static async delete(key: string) {
    await axiosInstance.delete(`/settings/${key}`);
    return true;
  }
}

export default SettingsService;
