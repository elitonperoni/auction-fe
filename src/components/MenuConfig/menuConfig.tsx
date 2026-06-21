import { Settings } from "lucide-react"; 
import LanguageSwitcher from "../LanguageSwitcher/languageSwitcher";

export default function ConfigButton() {
    return (
        <div className="relative group inline-block">
            <button className="p-2 rounded-md  dark:hover:bg-gray-800 transition-colors focus:outline-none">
                <Settings className="w-5 h-5 text-white dark:text-gray-300" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-max p-4 bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-500">Idioma</p>
                    <LanguageSwitcher />
                </div>
            </div>
        </div>
    );
}