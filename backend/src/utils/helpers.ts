export const generateRoomId = () => {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

export const getVoterIdentifier = (req: any) => {
  return req.user ? req.user._id.toString() : req.ip;
};


// Normalize and extract the first IP address
export const getClientIp = (req: any) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress;

  return ip;
};