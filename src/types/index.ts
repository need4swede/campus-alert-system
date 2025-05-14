
// Alert types
export type AlertType = 'hold' | 'secure' | 'lockdown' | 'evacuate' | 'shelter' | null;

// User roles
export type UserRole = 'user' | 'admin' | 'super-admin';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Alert interface
export interface Alert {
  id: string;
  type: AlertType;
  initiatedBy: User;
  timestamp: Date;
  active: boolean;
  resolvedBy?: User;
  resolvedAt?: Date;
  location?: string;
  note?: string;
}

// Protocol Message interface
export interface ProtocolMessage {
  type: AlertType;
  message: string;
  releaseMessage: string;
}

// App configuration
export interface AppConfig {
  evacuationLocation: string;
  shelterHazardType: string;
  serverUrl: string;
  topicConfig: Record<string, string>;
}
