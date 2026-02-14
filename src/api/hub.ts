"use-client"

import * as signalR from "@microsoft/signalr";
import { authApi } from ".";

let connection: signalR.HubConnection | null = null;

let connectionPromise: Promise<void> | null = null;

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
       withCredentials: true,
       accessTokenFactory: async () => {
         try {           
           await authApi.ensureValidToken();          
           return ""; 
         } catch (error) {
           console.error("Erro ao validar/renovar o cookie antes de conectar no SignalR", error);
           return "";
         }
       }
    })
    .withAutomaticReconnect()
    .build();

  return connection;
}

export async function startSignalRConnection(): Promise<signalR.HubConnection> {
  const conn = getSignalRConnection();

  if (conn.state === signalR.HubConnectionState.Connected) {
    return conn;
  }

  if (!connectionPromise) {
    connectionPromise = conn.start()
      .then(() => {
        console.log("SignalR Conectado com sucesso!");
      })
      .catch((err) => {
        connectionPromise = null; 
        throw err;
      });
  }

  await connectionPromise;
  
  return conn;
}