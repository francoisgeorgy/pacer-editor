
    F0 00 01 77 7F 01 01 01
    7E 5B 01 00 00 5C 01 61
    00 5D 01 00 00 5E 01 00
    00 5F 01 00 48 F7
    
Format:

    <start>  <header>     <cmd> <tgt> <idx> <obj> <elm> <data>  <cs> <end>
    F0       00 01 77 7F  01    01    01    7E    5B    01..00  48   F7      
    
Sysex header:

    F0         Mark the start of the SysEx message
    00 01 77   Manufacturer's ID for Nektar Technology Inc
    7F         Custom part of header
    xx		   Data
    48         Checksum
    F7		   Mark the end of the SysEx message
    
Sysex data:    

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
    
    
