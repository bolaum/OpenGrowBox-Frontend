const isValidJWT = (token) => {
    if (!token) return false;
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    return jwtPattern.test(token);
  };

  export default isValidJWT