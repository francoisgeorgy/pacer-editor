## LED config

LEDs config not transmitted when requested a single stompswitch configuration:

    00 01 77 7F 02 01 14 0D 5C
    
the response does not contains any LED data.

We need to request the config of the complete preset to get the LED data:

    00 01 77 7F 02 01 14 7F 6A
    
    
    
    