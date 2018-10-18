Sysex for a preset:

    00  F0 00 01 77 7F 01 01 00  01 01 05 4E 4F 54 45 53  |   w       NOTES|
    10  6E F7                                             |n |

Sysex header:

    0xF0		    Mark the start of the SysEx message
    0x00 0x01 0x77  Manufacturer's ID for Nektar Technology Inc
    xx		        data (N-5 bytes)
    0xF7		    Mark the end of the SysEx message
    
Data:    

    7F 
    01 
    01 
    00 
    01 
    01 
    05 
    4E 
    4F 
    54 
    45 
    53 
    10
    6E
    
    