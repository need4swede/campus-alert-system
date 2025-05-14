
import { ProtocolMessage } from '@/types';

export const protocolMessages: ProtocolMessage[] = [
  {
    type: 'hold',
    message: 'Hold! Remain in your room or area. Clear the halls and outdoor areas.',
    releaseMessage: 'Students and Staff, the hold has been released.'
  },
  {
    type: 'secure',
    message: 'Secure! Get inside. Lock outside doors.',
    releaseMessage: 'The Secure is released. All clear.'
  },
  {
    type: 'lockdown',
    message: 'Lockdown! Locks, Lights, Out of Sight!',
    releaseMessage: 'NO PUBLIC RELEASE!!'
  },
  {
    type: 'evacuate',
    message: 'Evacuate to {location}!',
    releaseMessage: 'Evacuation is over, please return to class.'
  },
  {
    type: 'shelter',
    message: 'Shelter for {hazard}!',
    releaseMessage: 'Shelter is released. All clear.'
  }
];

export const getProtocolMessage = (type: string | null, config: { location?: string; hazard?: string } = {}): string => {
  if (!type) return '';
  
  const protocol = protocolMessages.find(p => p.type === type);
  if (!protocol) return '';
  
  let message = protocol.message;
  
  // Replace placeholders
  if (message.includes('{location}') && config.location) {
    message = message.replace('{location}', config.location);
  }
  
  if (message.includes('{hazard}') && config.hazard) {
    message = message.replace('{hazard}', config.hazard);
  }
  
  return message;
};

export const getReleaseMessage = (type: string | null): string => {
  if (!type) return '';
  
  const protocol = protocolMessages.find(p => p.type === type);
  if (!protocol) return '';
  
  return protocol.releaseMessage;
};
