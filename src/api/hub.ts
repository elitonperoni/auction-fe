"use-client"

import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
let connection: signalR.HubConnection | null = null;

const HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL;

export function getSignalRConnection(): signalR.HubConnection {
  if (connection) {
    return connection;
  }

  if (!HUB_URL) {
    throw new Error(
      "SignalR Hub URL is not defined in .env (NEXT_PUBLIC_SIGNALR_HUB_URL)"
    );
  }
  const token = Cookies.get("auth-token") || "";

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => {
        return token;
      },
    })
    .withAutomaticReconnect()
    .build();

  return connection;
}