import { showToast } from "nextjs-toast-notify";

export default function ToastError(message: string) {
  return showToast.error(message, {
    duration: 4000,
    progress: true,
    position: "top-right",
    transition: "bounceIn",
    icon: "",
    sound: true,
  });
}
