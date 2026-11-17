
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 100

// Vehicle structure
struct Vehicle {
    int id;
    char type[10];
    int space;
};

void bruteForce(struct Vehicle vehicles[], int n, int index,
                int usedSpace, int capacity, int currentCount,
                int currentSelected[], int *bestCount,
                int bestSelected[]) {

    // Base case: all vehicles have been considered
    if (index == n) {

        if (usedSpace <= capacity && currentCount > *bestCount) {
            *bestCount = currentCount;

            for (int i = 0; i < n; i++) {
                bestSelected[i] = currentSelected[i];
            }
        }

        return;
    }

    // Choice 1: Do not select the current vehicle
    currentSelected[index] = 0;

    bruteForce(vehicles, n, index + 1,
               usedSpace, capacity, currentCount,
               currentSelected, bestCount, bestSelected);

    // Choice 2: Select the current vehicle if it fits
    if (usedSpace + vehicles[index].space <= capacity) {

        currentSelected[index] = 1;

        bruteForce(vehicles, n, index + 1,
                   usedSpace + vehicles[index].space,
                   capacity, currentCount + 1,
                   currentSelected, bestCount, bestSelected);
    }

    currentSelected[index] = 0;
}

void backtracking(struct Vehicle vehicles[], int n, int index,
                  int usedSpace, int capacity, int currentCount,
                  int currentSelected[], int *bestCount,
                  int bestSelected[]) {

    // Stop when all vehicles have been considered
    if (index == n) {

        if (currentCount > *bestCount) {
            *bestCount = currentCount;

            for (int i = 0; i < n; i++) {
                bestSelected[i] = currentSelected[i];
            }
        }

        return;
    }

    // Choice 1: Select the current vehicle if it fits
    if (usedSpace + vehicles[index].space <= capacity) {

        currentSelected[index] = 1;

        backtracking(vehicles, n, index + 1,
                     usedSpace + vehicles[index].space,
                     capacity, currentCount + 1,
                     currentSelected, bestCount, bestSelected);
    }

    // Choice 2: Do not select the current vehicle
    currentSelected[index] = 0;

    backtracking(vehicles, n, index + 1,
                 usedSpace, capacity, currentCount,
                 currentSelected, bestCount, bestSelected);
}

void greedy(struct Vehicle vehicles[], int n, int capacity,
            int selected[], int *bestCount) {

    struct Vehicle temp[MAX];

    // Copy original vehicle details
    for (int i = 0; i < n; i++) {
        temp[i] = vehicles[i];
        selected[i] = 0;
    }

    // Sort vehicles by required space (ascending order)
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {

            if (temp[j].space > temp[j + 1].space) {

                struct Vehicle swap = temp[j];
                temp[j] = temp[j + 1];
                temp[j + 1] = swap;
            }
        }
    }

    int usedSpace = 0;
    *bestCount = 0;

    // Select the smallest vehicles first
    for (int i = 0; i < n; i++) {

        if (usedSpace + temp[i].space <= capacity) {

            usedSpace += temp[i].space;
            (*bestCount)++;

            // Find the original vehicle position
            for (int j = 0; j < n; j++) {
                if (vehicles[j].id == temp[i].id) {
                    selected[j] = 1;
                    break;
                }
            }
        }
    }
}


// DYNAMIC PROGRAMMING

void dynamicProgramming(struct Vehicle vehicles[], int n,
                        int capacity, int selected[],
                        int *bestCount) {

    int dp[n + 1][capacity + 1];

    // Initialize the DP table
    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            dp[i][w] = 0;
        }
    }

    // Fill the DP table
    for (int i = 1; i <= n; i++) {

        for (int w = 0; w <= capacity; w++) {

            // Do not select the current vehicle
            dp[i][w] = dp[i - 1][w];

            // Select the current vehicle if it fits
            if (vehicles[i - 1].space <= w) {

                int include =
                    1 + dp[i - 1][w - vehicles[i - 1].space];

                if (include > dp[i][w]) {
                    dp[i][w] = include;
                }
            }
        }
    }

    // Store the maximum number of vehicles
    *bestCount = dp[n][capacity];

    // Initialize selected array
    for (int i = 0; i < n; i++) {
        selected[i] = 0;
    }

    // Trace back to find selected vehicles
    int w = capacity;

    for (int i = n; i > 0; i--) {

        if (dp[i][w] != dp[i - 1][w]) {

            selected[i - 1] = 1;

            w -= vehicles[i - 1].space;
        }
    }
}



int main() {

    int capacity, n;

    struct Vehicle vehicles[MAX];
    int currentSelected[MAX] = {0};
    int bestSelected[MAX] = {0};
    int bestCount = 0;
    int backtrackSelected[MAX] = {0};
    int backtrackBestSelected[MAX] = {0};
    int backtrackBestCount = 0;
    int greedySelected[MAX] = {0};
    int greedyBestCount = 0;
    int dpSelected[MAX] = {0};
int dpBestCount = 0;
    printf("====================================\n");
    printf(" INTELLIGENT CAMPUS PARKING SYSTEM\n");
    printf("====================================\n");

    printf("\nEnter total parking capacity: ");
    scanf("%d", &capacity);

if (capacity <= 0) {
    printf("Invalid parking capacity!\n");
    return 1;
}

    printf("Enter number of vehicles: ");
scanf("%d", &n);

if (n < 0 || n > MAX) {
    printf("Invalid number of vehicles!\n");
    return 1;
}


    for (int i = 0; i < n; i++) {

        printf("\nEnter details for vehicle %d\n", i + 1);

        printf("Enter vehicle ID: ");
        scanf("%d", &vehicles[i].id);

        printf("Enter vehicle type (Car/Bike): ");
        scanf("%9s", vehicles[i].type);

        printf("Enter required space: ");
        scanf("%d", &vehicles[i].space);

if (vehicles[i].space <= 0) {
    printf("Invalid vehicle space!\n");
    return 1;
}
    }

printf("\n========== BRUTE FORCE RESULT ==========\n");

bruteForce(vehicles, n, 0, 0, capacity, 0,
           currentSelected, &bestCount, bestSelected);

int totalSpace = 0;

printf("\nSelected Vehicles:\n");

for (int i = 0; i < n; i++) {
    if (bestSelected[i] == 1) {
        printf("Vehicle ID: %d | Type: %s | Space: %d\n",
               vehicles[i].id,
               vehicles[i].type,
               vehicles[i].space);

        totalSpace += vehicles[i].space;
    }
}

printf("\nTotal Vehicles Accommodated: %d\n", bestCount);
printf("Total Space Used: %d\n", totalSpace);
printf("Remaining Space: %d\n", capacity - totalSpace);



// BACKTRACKING

printf("\n========== BACKTRACKING RESULT ==========\n");

backtracking(vehicles, n, 0, 0, capacity, 0,
             backtrackSelected, &backtrackBestCount,
             backtrackBestSelected);

int backtrackTotalSpace = 0;

printf("\nSelected Vehicles:\n");

for (int i = 0; i < n; i++) {

    if (backtrackBestSelected[i] == 1) {

        printf("Vehicle ID: %d | Type: %s | Space: %d\n",
               vehicles[i].id,
               vehicles[i].type,
               vehicles[i].space);

        backtrackTotalSpace += vehicles[i].space;
    }
}

printf("\nTotal Vehicles Accommodated: %d\n",
       backtrackBestCount);

printf("Total Space Used: %d\n", backtrackTotalSpace);

printf("Remaining Space: %d\n",
       capacity - backtrackTotalSpace);
       printf("\n========== GREEDY RESULT ==========\n");

greedy(vehicles, n, capacity,
       greedySelected, &greedyBestCount);
       int greedyTotalSpace = 0;

printf("\nSelected Vehicles:\n");

for (int i = 0; i < n; i++) {

    if (greedySelected[i] == 1) {

        printf("Vehicle ID: %d | Type: %s | Space: %d\n",
               vehicles[i].id,
               vehicles[i].type,
               vehicles[i].space);

        greedyTotalSpace += vehicles[i].space;
    }
}

printf("\nTotal Vehicles Accommodated: %d\n",
       greedyBestCount);

printf("Total Space Used: %d\n", greedyTotalSpace);

printf("Remaining Space: %d\n",
       capacity - greedyTotalSpace);



// DYNAMIC PROGRAMMING

printf("\n========== DYNAMIC PROGRAMMING RESULT ==========\n");

dynamicProgramming(vehicles, n, capacity,
                   dpSelected, &dpBestCount);

int dpTotalSpace = 0;

printf("\nSelected Vehicles:\n");

for (int i = 0; i < n; i++) {

    if (dpSelected[i] == 1) {

        printf("Vehicle ID: %d | Type: %s | Space: %d\n",
               vehicles[i].id,
               vehicles[i].type,
               vehicles[i].space);

        dpTotalSpace += vehicles[i].space;
    }
}

printf("\nTotal Vehicles Accommodated: %d\n",
       dpBestCount);

printf("Total Space Used: %d\n", dpTotalSpace);

printf("Remaining Space: %d\n",
       capacity - dpTotalSpace);




printf("\n========== VEHICLE DETAILS ==========\n");

    for (int i = 0; i < n; i++) {

        printf("ID: %d | Type: %s | Space: %d\n",
               vehicles[i].id,
               vehicles[i].type,
               vehicles[i].space);
    }

    return 0;
}
