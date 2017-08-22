public class Calculator {

    /* This program allows you to do basic
    calculator operations  */

    public Calculator() {

    }

    public int add(int a, int b) {
      return a + b;
    }

    public int subtract(int a, int b) {
      return a - b;
    }

    public int multiply(int a, int b) {
      return a * b;
    }

    public int divide(int a, int b) {
      if (b == 0) {
        System.out.println("Error! Dividing by zero is not allowed.");
        return 0;
      } else {
        return a / b;
      }
    }

    public int modulo(int a, int b) {
      if (b == 0) {
        System.out.println("Error! Dividing by zero is not allowed.");
        return 0;
      } else {
        return a % b;
      }
    }

  public static void main(String[] args) {
    Calculator myCalculator = new Calculator();
    System.out.println(myCalculator.add(5,7));
    System.out.println(myCalculator.subtract(45, 11));

    /* Suppose things could be improved my not using as many methods.
    You could pass in what operator you want, then use a switch statment.

    Being able to use the program via the command line would be nice.
     */
  }
}
