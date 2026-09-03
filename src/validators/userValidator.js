
function validateUpdateUser(body) {
  const { firstname, lastname, phone } = body;
  const errors = [];

  if (firstname !== undefined && (typeof firstname !== "string" || !firstname.trim())) {
    errors.push("firstname must be a non-empty string");
  }
  if (lastname !== undefined && (typeof lastname !== "string" || !lastname.trim())) {
    errors.push("lastname must be a non-empty string");
  }
  if (phone !== undefined && typeof phone !== "string") {
    errors.push("phone must be a string");
  }

  return errors.length ? { error: errors.join(", ") } : { value: { firstname, lastname, phone } };
}

export { validateUpdateUser };