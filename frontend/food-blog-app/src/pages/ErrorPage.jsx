import React from "react";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  // Safely convert error object to string if needed
  const getErrorMessage = (err) => {
    if (!err) return "Unknown error occurred";
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    if (err.statusText) return err.statusText;
    if (typeof err === "object") return JSON.stringify(err);
    return "Unknown error occurred";
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Oops! Something went wrong.</h1>
      <p>{getErrorMessage(error)}</p>
      {error && error.status && <p>Status Code: {error.status}</p>}
    </div>
  );
}
