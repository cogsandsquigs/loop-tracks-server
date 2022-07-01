export class Logger {
    public static debug(message: any) {
        this.log(`[DEBUG] ${message}`);
    }

    public static info(message: any) {
        this.log(`[INFO] ${message}`);
    }

    public static warn(message: any) {
        this.log(`[WARN] ${message}`);
    }

    public static error(message: any) {
        this.log(`[ERROR] ${message}`);
    }

    private static log(message: any) {
        console.log(`${new Date().toISOString()} ${message}`);
    }
}
