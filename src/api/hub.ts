"use-client"

import * as signalR from "@microsoft/signalr";
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

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
       withCredentials: true
    })
    .withAutomaticReconnect()
    .build();

  return connection;
}