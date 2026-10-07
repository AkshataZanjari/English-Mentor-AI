export function displayName(user: { name?: string | null; email?: string | null }): string {
  if (user.name && user.name.trim() !== "") {
    return user.name;
  }
  if (user.email && user.email.includes("@")) {
    return user.email.split("@")[0];
  }
  return "there";
}
