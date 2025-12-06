import { showToast } from "nextjs-toast-notify";

export default function ToastSuccess(message: string) {
  return showToast.success(message, {
    duration: 4000,
    progress: true,
    position: "top-right",
    transition: "bounceIn",
    icon: "",
    sound: true,
  });
}
