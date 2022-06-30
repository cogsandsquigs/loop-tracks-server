export class Logger {
  public static info(message: string) {
    this.log(`[INFO] ${message}`);
  }

  public static error(message: string) {
    this.log(`[ERROR] ${message}`);
  }

  private static log(message: string) {
    console.log(new Date().toISOString() + " " + message);
  }
}
