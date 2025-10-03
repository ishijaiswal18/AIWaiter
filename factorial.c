#include <stdio.h>

int main() {
    float C, F;  // C = Celsius, F = Fahrenheit

    // Ask user for input
    printf("Enter temperature in Celsius: ");
    scanf("%f", &C);

    // Conversion formula
    F = (C * 9 / 5) + 32;

    // Show result
    printf("%.2f Celsius = %.2f Fahrenheit\n", C, F);

    return 0; // End program
}
