import { v4 as uuidv4 } from "uuid";

export function getUserId(): string {
  let userId = localStorage.getItem("anonUserId");
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("anonUserId", userId);
  }
  return userId;
}
