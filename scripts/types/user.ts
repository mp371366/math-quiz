import { isString } from "./utils";

export default interface User {
  username: string;
  password: string;
}

export function isUser(data: any): data is User {
  return data
    && isString(data.username)
    && isString(data.password);
}