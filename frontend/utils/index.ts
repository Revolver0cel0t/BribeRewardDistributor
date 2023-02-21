/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}

export function formatAddress(address: string, length = "short") {
  try {
    if (address && length === "short") {
      address =
        address.substring(0, 6) +
        "..." +
        address.substring(address.length - 4, address.length);
      return address;
    } else if (address && length === "long") {
      address =
        address.substring(0, 12) +
        "..." +
        address.substring(address.length - 8, address.length);
      return address;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
