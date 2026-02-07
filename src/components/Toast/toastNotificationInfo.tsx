import { showToast } from "nextjs-toast-notify";

export default function ToastInfo(message: string) {
  return showToast.info(message, {
    duration: 4000,
    progress: true,
    position: "top-right",
    transition: "bounceIn",
    icon: "",
    sound: true,
  });
}
