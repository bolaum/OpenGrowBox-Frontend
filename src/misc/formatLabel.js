const formatLabel = (label) => {
    return label
      .replace(/^OGB_/, '')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
};


export default formatLabel