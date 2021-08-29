## Requests

Read preset 0x07:

    sendmidi dev MIDI1 syx hex 00 01 77 7F 02 01 07 7F 77
    
Read preset 0x17:

    sendmidi dev MIDI1 syx hex 00 01 77 7F 02 01 17 7F 67
    
Read preset 0x18 (D6)

    sendmidi dev MIDI1 syx hex 00 01 77 7F 02 01 18 7F 66



The Pacer never responds when we request the preset D6. Bug?

Read ALL presets:

    sendmidi dev MIDI1 syx hex 00 01 77 7F 02 01 7F 7E

### Read Full dump:

Note: the doc says 0x07 instead of 0x7F.

    sendmidi dev MIDI1 syx hex 00 01 77 7F 02 7F 

## Convert ASCII plain text hex dump to binary files:

    $ xxd -r -p A1.syx.hex > A1.syx
    
result:

    $ xxd A1.syx.bin | head
    0000000: f000 0177 7f01 0101 7e5b 0100 005c 0161  ...w....~[...\.a
    0000010: 005d 0100 005e 0100 005f 0100 48f7 f000  .]...^..._..H...
    0000020: 0177 7f01 0101 7e55 0100 0056 0161 0057  .w....~U...V.a.W
    0000030: 0100 0058 0100 0059 0100 66f7 f000 0177  ...X...Y..f....w
    0000040: 7f01 0101 7e4f 0100 0050 0161 0051 0100  ....~O...P.a.Q..
    0000050: 0052 0100 0053 0100 04f7 f000 0177 7f01  .R...S.......w..
    0000060: 0101 7e49 0100 004a 0161 004b 0100 004c  ..~I...J.a.K...L
    0000070: 0100 004d 0100 22f7 f000 0177 7f01 0101  ...M.."....w....
    0000080: 7e43 0100 0044 0161 0045 0100 0046 0100  ~C...D.a.E...F..
    0000090: 0047 0100 40f7 f000 0177 7f01 0101 7e3d  .G..@....w....~=
    

## Convert binary file to ASCII plain text hex dump:

    $ xxd -g1 A1.syx > A1.syx.hex

    
## Examples of SysEx messages:

preset 5, SW1, set step 1 note to F3

    7F 01 01 05 0D 01 01 00 00 02 01 43 00 03 01 35 00 04 01 7F 00 05 01 00 00 06 01 01 40 01 00 00 41 01 7F 00 42 01 7F 00 43 01 00 00 51

    00  F0 00 01 77 7F 01 01 05  0D 01 01 00 00 02 01 43  |   w           C|
    10  00 03 01 35 00 04 01 7F  00 05 01 00 00 06 01 01  |   5            |
    20  40 01 00 00 41 01 7F 00  42 01 7F 00 43 01 00 00  |@   A   B   C   |
    30  51 F7                                             |Q |

preset 5, SW2, set step 1 note to B3

    7F 01 01 05 0E 01 01 00 00 02 01 43 00 03 01 3B 00 04 01 7F 00 05 01 00 00 06 01 01 40 01 00 00 41 01 7F 00 42 01 7F 00 43 01 00 00 4A
    
    
## Sysex format:

    <start>  <header>     <cmd> <tgt> <idx> <obj> <elm> <data>  <cs> <end>
    F0       00 01 77 7F  01    01    01    7E    5B    01..00  48   F7      
    
### Sysex header:

    F0         Mark the start of the SysEx message
    00 01 77   Manufacturer's ID for Nektar Technology Inc
    7F         Custom part of header
    xx		   Data
    48         Checksum
    F7		   Mark the end of the SysEx message
    
### Sysex data:    

    01      cmd     identifies whether data is set or requested.            Set data
    01      target  identifies the target for the data                      Data for preset
    01      idx     identifies which preset the data is for                 User Preset A1
    7E      obj     identifies which control or setting the data is for     MIDI Configuration 
    5B      elm     identifies which aspect of a control the data is for    Setting 16 values
    01 00 00 5C 
    01 61 00 5D 
    01 00 00 5E 
    01 00 00 5F 
    01 00 48
    
Other example:

    00 01 77 
    7F 
    
    01      cmd = set data 
    01      tgt = target preset
    01      idx = preset A1 
    0D      obj = stompswitch 1 
    01      elm = step 1, channel      
    01      data = 01
    00      message type?  
    00      data 1? 
    02      data 2?    
    01      data 3? 
    45      step active?      
    00 
    03 01 00 00 
    04 01 00 00 
    05 01 00 00 
    06 01 01 0F


Other example:

    01      cmd = set data 
    01      tgt = target preset
    01      idx = preset A1 
    37      obj = expression pedal 2
    60      elm = Control Mode
    01 00 65 


Other example:

    01      cmd = set data 
    01      tgt = target preset
    01      idx = preset A1 
    0D      obj = stompswitch 1 
    19      Step 5 values
    01 00 00 
    1A      Step 5 values
    01 61 00 
    1B      Step 5 values
    01 00 00 
    1C      Step 5 values 
    01 00 00 
    1D      Step 5 values
    01 00 00 
    1E      Step 5 values
    01 00 64 


Other example:
    
    F0 00 01 77 7F 
    01 01 01                    set preset A1
    7E 5B 01 00 00 5C 01 61
    00 5D 01 00 00 5E 01 00
    00 5F 01 00 48 F7
    
    F0 00 01 77 7F 
    01 01 01                    set preset A1
    7E 55 01 00 00 56 01 61
    00 57 01 00 00 58 01 00
    00 59 01 00 66 F7
    
Message to change preset:

Global
0xF0 0x00 0x01 0x77 0x7F <cmd> 0x05 <idx> <obj> <elm> <data> <cs> <0xF7>

select preset C5 (0x10) :

    01 05 00 
    01              obj
    1E              elm
    01 10           1 byte data, data = 10
       

message to update name:

    01                  set
    01                  preset
    01                  preset #1
    01                  obj is name
    05                  5 bytes 
    50 41 50 41 50      data = PAPAP
        
    01 01 01 01 00 05 41 42 43 44 45    ABCDE
    
    01 01 01 01 00 05 41 41 41 41 41    AAAAA
    
    01 01 01 01 00 05 43 43 43 43 43 
    
    01 01 01 01 00 05 42 41 42 45 45 
    
    
Message to select preset

    01  set
    05  global
    00  cur preset
    01  global elm
    1E  cur user preset
    04  preset A5
    
    01 05 00 01 1E 04   DOES NOT WORK. DO NOT SEND. NEED RESET AFTER.
    
Preset control:

    F0 00 01 77 7F 
    01 
    01 
    07 
    0E      control 2 
    01 01 00 00 
    02 01 47 00 
    03 01 2B 00 
    04 01 7F 00 
    05 01 00 00 
    06 01 01 5C 
    F7    
    
Set B1 SW1 step 1 OFF color:

    7F 
    01 
    01 
    07              B1 
    0D              SW1
    40 01 01 00 
    41 01 09 00 
    42 01 0A 00 
    43 01 01 00 
    4B    
    
    7F 01 01 07 0D 40 01 01 00 41 01 09 00 42 01 0A 00 43 01 01 00 4B
    
    
    
    F0 00 01 77 
    7F 01 01 07 0D 40 01 01 00 41 01 09 00 42 01 0A 00 43 01 01 00 4B 
    F7                 


## Read current globals

    $ sendmidi dev MIDI1 syx hex 00 01 77 7F 02 05 00 79
    
    
    system-exclusive hex 00 01 77 7F 01 05 01 01 01 01 01 00 09 01 00 00 30 01 00 00 62 01 04 00 63 01 01 6E dec
    system-exclusive hex 00 01 77 7F 01 05 01 23 01 01 00 00 02 01 00 00 03 01 00 00 04 01 00 48 dec
    system-exclusive hex 00 01 77 7F 01 05 01 25 01 01 01 00 02 01 01 00 03 01 01 00 04 01 01 42 dec
    system-exclusive hex 00 01 77 7F 01 05 01 26 01 01 00 00 02 01 17 00 03 01 00 00 04 01 03 00 05 01 1A 0B dec
    system-exclusive hex 00 01 77 7F 01 05 01 27 01 01 01 00 02 01 01 4B dec
    system-exclusive hex 00 01 77 7F 01 05 02 01 01 01 01 00 09 01 00 00 30 01 00 00 62 01 04 00 63 01 01 6D dec
    system-exclusive hex 00 01 77 7F 01 05 02 23 01 01 00 00 02 01 00 00 03 01 00 00 04 01 00 47 dec
    system-exclusive hex 00 01 77 7F 01 05 02 25 01 01 01 00 02 01 01 00 03 01 01 00 04 01 01 41 dec
    system-exclusive hex 00 01 77 7F 01 05 02 26 01 01 00 00 02 01 17 00 03 01 00 00 04 01 03 00 05 01 1A 0A dec
    system-exclusive hex 00 01 77 7F 01 05 02 27 01 01 01 00 02 01 01 4A dec
    system-exclusive hex 00 01 77 7F 01 05 03 01 01 01 01 00 09 01 00 00 30 01 00 00 62 01 04 00 63 01 01 6C dec
    system-exclusive hex 00 01 77 7F 01 05 03 23 01 01 00 00 02 01 00 00 03 01 00 00 04 01 00 46 dec
    system-exclusive hex 00 01 77 7F 01 05 03 25 01 01 01 00 02 01 01 00 03 01 01 00 04 01 01 40 dec
    system-exclusive hex 00 01 77 7F 01 05 03 26 01 01 00 00 02 01 17 00 03 01 00 00 04 01 03 00 05 01 1A 09 dec
    system-exclusive hex 00 01 77 7F 01 05 03 27 01 01 01 00 02 01 01 49 dec
    system-exclusive hex 00 01 77 7F 01 05 04 01 01 01 01 00 09 01 00 00 30 01 00 00 62 01 04 00 63 01 01 6B dec
    system-exclusive hex 00 01 77 7F 01 05 04 23 01 01 00 00 02 01 00 00 03 01 00 00 04 01 00 45 dec
    system-exclusive hex 00 01 77 7F 01 05 04 25 01 01 01 00 02 01 01 00 03 01 01 00 04 01 01 3F dec
    system-exclusive hex 00 01 77 7F 01 05 04 26 01 01 00 00 02 01 17 00 03 01 00 00 04 01 03 00 05 01 1A 08 dec
    system-exclusive hex 00 01 77 7F 01 05 04 27 01 01 01 00 02 01 01 48 dec

