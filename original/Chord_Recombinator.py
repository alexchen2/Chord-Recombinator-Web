# !/usr/bin/env python
# coding: utf-8

import itertools

# Important data structures

# this list restricts users to enter characters
# inside as note names.
notes_allowed = ['B#', 'C', 'C#', 'Db', 'Cx', 'D',
                 'D#', 'Eb', 'E', 'Fb', 'E#', 'F',
                 'F#', 'Gb', 'Fx', 'G', 'G#', 'Ab',
                 'Gx', 'A', 'Bbb', 'A#', 'Bb', 'B', 'Cb']

# this nested list assigns a note a number from 0-11
# based on the location of their sub-list. The numbers
# are based on the indices of the sub-lists.
# Ex: C is assigned 0, since it's list is the 0th
# item in out nested list.
note_map = [['B#', 'C'], ['C#', 'Db'], ['Cx', 'D'],
            ['D#', 'Eb'], ['E', 'Fb'], ['E#', 'F'],
            ['F#', 'Gb'], ['Fx', 'G'], ['G#', 'Ab'],
            ['Gx', 'A', 'Bbb'], ['A#', 'Bb'], ['B', 'Cb']]

# this dictionary
chord_dict = {'Major Chord': {'[0, 4, 7]': 0},
              'Major Seventh Chord': {'[0, 1, 5, 8]': 1},
              'Minor Major Seventh Chord': {'[0, 1, 4, 8]': 1},
              'Minor Chord': {'[0, 3, 7]': 0},
              'Minor Seventh Chord': {'[0, 3, 5, 8]': 2},
              'Half Diminished Seventh': {'[0, 2, 5, 8]': 1},
              'Augmented Chord': {'[0, 4, 8]': 0},
              'Diminished Chord': {'[0, 3, 6]': 0},
              'Dominant Seventh Chord': {'[0, 3, 6, 8]': 3},
              'Dominant Ninth Chord': {'[0, 2, 4, 6, 9]': 1},
              'Dominant Thirteenth Chord': {'[0, 1, 3, 5, 7, 8, 10]': 2,
                                            '[0, 1, 3, 5, 6, 8, 10]': -2,
                                            '[0, 2, 3, 5, 7, 8, 10]': -1},
              'Lydian Dominant/Acoustic Scale': {'[0, 2, 3, 5, 6, 8, 10]': -2,
                                                 '[0, 2, 4, 5, 7, 8, 10]': -1,
                                                 '[0, 1, 3, 4, 6, 8, 10]': 4},
              'Diminished Seventh Chord': {'[0, 3, 6, 9]': 0},
              'Quartal Chord': {'[0, 2, 5, 7]': 1},
              'Sus or Quartal Chord': {'[0, 2, 7]': 0}
              }

# below is a while-loop for user input.
user_input = ""
notes = []

print("Please enter a note. Type 'done' once you are done.")
print("Enter 's' or 'S' to start over.")
print("Enter 'q' or 'Q' to quit the program.")
print("Enter 'h' or 'H' for a help guide.")
print("Enter 'm' or 'M' if you've made a mistake.")
print("Enter 'v' or 'V' to view the notes you've entered so far.")

while user_input != 'done':
    user_input = input("Enter: ")
    # print("\n")

  # if user_input.islower():
  #     print("Converting to capital letter\n")
  #     user_input = user_input.upper()

    if user_input != 'done':
        if user_input == 's':
            print("Starting Over\n")
            notes = []

        elif user_input == 'q':
            print("Quitting Program. Goodbye!\n")
            quit()

        elif user_input == 'h':
            print("Help Guide coming soon!\n")

        elif user_input == 'm':
            try:
                print("Deleting mistake\n")
                notes.pop()
            except IndexError as ie:
                print(ie)
                print("There is nothing to delete! Add a note!\n")

        elif user_input == '':
            pass

        elif user_input == 'v':
            if len(notes) == 0:
                print("No notes have been entered yet!\n")
            else:
                print(f"Current notes entered:{notes}\n")

        # this block must be below any of the blocks
        # above! Or else the other conditions will
        # activate this if-statement if placed below.
        elif user_input not in notes_allowed:
            print("Please enter a valid note name.")
            print("Here is a list of valid note names:")
            print(f"{notes_allowed}\n")

        else:
            notes.append(str(user_input))


# This is our chord parser. It will split the user input into
# small groups of 3 to 7. Each group will not have the
# exact same notes (combinations).
# Note that this relies on itertools.

combos = []

for l in range(3, len(notes) + 1):
    for i in itertools.combinations(notes, l):
        combos.append(i)

print(f"combinations:{combos}\n")

'''
this loop labels each
of our notes by numbers.
based on the their position
in note_map
'''
no_id = []  # an empty list to store unidentified chords.

for c in combos:
    pc_set = []  # pitch class set: a set of different notes.
    for grp in c:
        for nm in note_map:
            if grp in nm:
                pitch_class = note_map.index(nm)
                pc_set.append(pitch_class)
                # print(i, pitch_class)
                break

    # this dict comprehension labels notes with their numbers.
    # full name is labelled_pc_set
    l_pc_set = {pc_set[i] : c[i] for i in range(len(c))}

    # print(list(l_pc_set.keys()))

    # below, we sort pc_set by ascending order (numbers)
    # full name is sorted_pc_set
    s_pc_set = sorted(pc_set)

    # print(s_pc_set)

    # this list stores the SORTED ascending notes in  the format: {"note" : "number"}
    chord = {l_pc_set.get(s_pc_set[i]) : s_pc_set[i] for i in range(len(pc_set))}

    # print(f"chord: {chord}")

    num_list = list(chord.values())  # stores numbers that label notes/pitches
    p_list = list(chord.keys())      # stores pitch names

    # print(p_list)

    # these variables are for the for-loop below
    # they will store newly arranged chords
    # until we find the arrangement in normal form.
    storage = p_list
    counter = 0
    normal_form = []    # WHY INSTANTIATE IT WITH A FUCKING LIST HERE IF YOU'RE GOING TO ASSIGN IT A DICT LATER!?!?

    # loop rearranges chords by position, and finds normal form.
    for s in range(len(storage)):
        pos = storage[1:]+[storage[0]]  # pos is chord position
        # pos stores the notes only, no pc numbers

        # print(f"current normal form: {normal_form}")
        # print(f" new chord: {pos}")

        # Format of inv: {note : pc number}
        inv = {pos[i]: chord[pos[i]] for i in range(len(pos))}  # inv is inversion
        # print(inv)

        inv_num_list = list(inv.values())
        diff_last = inv_num_list[-1] - inv_num_list[0]

        if diff_last < 0:
            # takes complement of interval difference to get positive pitch note interval value between first to last note of inv
            new_counter = 12 + diff_last

        else:
            new_counter = diff_last

        # therefore: new_counter just has pitch note difference between bottom and top note

        # print(f"new counter: {new_counter}")

        # IF STATEMENTS: just checks if new inversion has smaller pc diff from bottom to top; if not, then skips to next inv while keeping smallest pc diff value


        # If no inversion stored previously:
        if counter == 0:
            normal_form = inv
            counter = new_counter

        # If new inversion has same distance as previous inversion:
        elif new_counter == counter:
            # print("there is a tie!")
            # print(f"storage = {storage}")
            # prev_inv = {storage[i]:chord[storage[i]] for i in range(len(storage))}
            prev_inv = normal_form
            # print(f"prev_inv: {prev_inv}")

            p_i_num_list = list(prev_inv.values())

            # since there is a tie in pitch differences, we take the first and second-last
            # notes' interval.
            differences = []
            for lists in [inv_num_list, p_i_num_list]:
                # print(f"current list: {lists}")
                diff_pen = lists[-2]-lists[0]
                # print(f"{lists[-2]}-{lists[0]}={diff_pen}")
                if diff_pen < 0:
                    # print(f"{diff_pen}+12=")
                    diff_pen = diff_pen + 12      # take complement again if negative
                    # print(f"{diff_pen}")
                    differences.append(diff_pen)
                else:
                    differences.append(diff_pen)
            # print(f"new chord interval: {differences[0]}")
            # print(f"old chord interval: {differences[1]}")
            # new chord > old chord == old chord
            if differences[0] > differences[1]:
                # print(f"old chord: {p_i_num_list} {storage}")
                # counter changes
                # counter = new_counter
                normal_form = prev_inv
            # new chord < old chord == new chord
            elif differences[0] < differences[1]:
                # counter stays the same
                # print(f"new chord: {inv_num_list} {pos}")
                counter = new_counter
                normal_form = inv

            else:
                # print("Another tie?")

                # old chord's first note is the lowest
                if p_i_num_list[0] < inv_num_list[0]:
                    # print("Old chord wins!")
                    normal_form = prev_inv
                # new chord's first note is the lowest
                elif inv_num_list[0] < p_i_num_list[0]:
                    # print("New chord wins!")
                    normal_form = inv

        elif new_counter < counter:
            counter = new_counter
            normal_form = inv

        storage = pos

        # print(f"new normal form: {normal_form}\n")

    normal_form_p = list(normal_form.keys())  # normal form, with pitches only
    # normal form, with numbers only
    normal_form_n = list(normal_form.values())  # pitch class number values
    # print(f"Lowest interval difference is: {counter}")
    # print(f"Normal Form: {normal_form}")

    # Code below transposes Normal form such that
    # first note is a C

    first_pitch = list(normal_form.values())[0]  # 'slices' dict for 1st note.
    to_c = 12 - first_pitch

    t_normal_form = {}  # transposed normal form

    for k, v in normal_form.items():   
        new_v = v + to_c

        if new_v >= 12:
            t_normal_form[k] = new_v % 12   

        else:
            t_normal_form[k] = new_v

    # transposed normal form w/ pitches
    p_t_n_form = list(t_normal_form.keys())
    # transposed normal form w/ numbers
    n_t_n_form = list(t_normal_form.values())

    # print(f"normal form transposed to C: {n_t_n_form}\n")

    # Code below identifies chord using chord_dict (from above)

    chord_identified = False

    for k, v in chord_dict.items():
        # print(f"values {v}")
        for code in v.keys():
            # print(f"code: {code}")
            if str(n_t_n_form) == code:
                root = normal_form_p[v[code]]
                chord_name = k
                # print(f"Chord is: {normal_form_p[v[code]]} {k}")
                # print(f"User entered: {notes}")
                chord_identified = True
                break
        if chord_identified:
            break

    if not chord_identified:
        no_id.append([normal_form_p, normal_form_n, n_t_n_form])
        # print(f"chord note yet identified {pc_set}")
        # print(f"Notes: {normal_form_p}\n")

    else:
        if chord_name == "Sus or Quartal Chord":
            print(
                f"Chord is:{root}Sus2, {normal_form_p[2]} Sus4 or {normal_form_p[1]} quartal chord")
            print(f"Notes:{normal_form_p}")
            print(f"Normal Form:{normal_form_n}\n")
        else:
            print(f"Chord is:{root} {chord_name}")
            print(f"Notes:{normal_form_p}")
            print(f"Normal Form:{normal_form_n}\n")

print("Unidentified chords:\n")
for n in no_id:
    print(n, "\n")
print("\n")

print(f"User entered:{notes}\n")
