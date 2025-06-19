export const generateRoomId = () => {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

export const getVoterIdentifier = (req: any) => {
  return req.user ? req.user._id.toString() : req.ip;
};
