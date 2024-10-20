import random
import os
import time

# Dimensions of the console window
width = os.get_terminal_size().columns
height = os.get_terminal_size().lines

# Set of characters to display
chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=_+[]{}|;:',.<>?/~`"

# Number of rows to display at a time
num_rows = 30

# Create an empty screen with the appropriate number of rows
screen = [' ' * width for _ in range(num_rows)]

# Define the ASCII face
face = [
    "###########     ###########",
    "#########         #########",
    "########           ########",
    "#######             #######",
    "######   ###   ###   ######",
    "######    ##   ##    ######",
    "######               ######",
    "######     #####     ######",
    "######      ###      ######",
    "#######             #######",
    "########           ########",
    "#########         #########",
    "###########     ###########",
    "############   ############",
    "############# #############",
    "###########################",
    "###########################"
]

# Starting position for the face
face_x = width // 2 - len(face[0]) // 2
face_y = height // 2 - len(face) // 2

try:
    while True:
        # Randomly update one of the rows
        row_index = random.randint(0, num_rows - 1)
        screen[row_index] = ''.join(random.choice(chars) for _ in range(width))

        # Print the screen with the face overlaid
        os.system('cls' if os.name == 'nt' else 'clear')
        for i in range(num_rows):
            if face_y <= i < face_y + len(face):
                # Overlay the face onto the screen, but don't overwrite ' ' symbols
                row_part = (
                    screen[i][:face_x] + ''.join(
                        screen_char if face_char == '#' else face_char
                        for face_char, screen_char in zip(face[i - face_y], screen[i][face_x:face_x + len(face[0])])
                    ) + screen[i][face_x + len(face[0]):]
                )
                print(row_part)
            else:
                print(screen[i])

        # Slow down the loop for visual effect
        time.sleep(0.05)
except KeyboardInterrupt:
    pass  # Exit the program gracefully when interrupted
