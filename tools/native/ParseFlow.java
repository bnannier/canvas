import java.nio.file.Path;
import maestro.orchestra.yaml.YamlCommandReader;

// Use Maestro's full command conversion, not its shallower check-syntax path.
// This source-file launcher never creates an Orchestra, driver, or device session.
public final class ParseFlow {
  public static void main(String[] args) {
    if (args.length != 1) {
      System.err.println("Expected one Maestro flow path");
      System.exit(1);
    }
    try {
      var commands = YamlCommandReader.INSTANCE.readCommands(Path.of(args[0]));
      System.out.println("CANVAS_NATIVE_FLOW_COMMANDS=" + commands.size());
    } catch (Exception error) {
      error.printStackTrace(System.err);
      System.exit(1);
    }
  }
}
