

    <start> <header> <cmd> <tgt> <idx> <obj> <elm> <data> <cs> <end>
    
    cmd 01 set
    cmd 02 get
    
    0x01	See tab <tgt>					Set	Set value on PACER
    0x02						Get	Request value from Pacer

tgt
    
    0x01	See Tab Preset-<idx>				Preset	
    0x05	See Tab Global-<idx>				Global	
    0x07	any	any	any	any	Full Backup	only valid for <cmd>=0x02 (Get)

GLOBAL
------

global idx
    
    0x00	<global-obj>			Current Preset	Changes RAM and EEPROM--modifies global setting and global config
    0x01				Global Preset 1	Changes EEPROM.  Changes RAM if Global Preset 1 is currently active.--only modifies global config
    0x02				Global Preset 2	Changes EEPROM.  Changes RAM if Global Preset 2 is currently active.--only modifies global config
    0x03				Global Preset 3	Changes EEPROM.  Changes RAM if Global Preset 3 is currently active.--only modifies global config
    0x04				Global Preset 4	Changes EEPROM.  Changes RAM if Global Preset 4 is currently active.--only modifies global config
    0x7F				ALL	Changes EEPROM and RAM

global obj
    
    0x01	<global-elm>		Global Setting	
    0x23	See Footswitch-<elm>		Footswitch Mode	
    0x25	See Relay-<elm>		Relay Mode	
    0x26	See Control-<elm>		Encoder	Only elm 0x01-0x05 are valid for Encoder
    0x27	See ExpressionPedal-<elm>		Expression Pedal	
    0x7F			ALL	

global elm

    0x01	    Channel	                Global Channel	
    0x09	    MIDI Source	            MIDI Jack Source	    
    0x30	    Patch Up/Down	        Patch Up/Down Function	
    0x62	    Dim Level	Brightness level of Dim LED	
    0x7F		All	
    
global elm with idx=0:    

    0x1A	    Active Preset	        Active Preset (user, track, trasnport, etc...)	    <data-active-preset>
    0x1E	    Current User Preset	    Current User Preset (1A-6D)                         <data-CurUserPreset>	
    0x31	    Current Global Config	Current Global Config (1-4)	
    0x32-0x41	Program	                Program Value (channel 1-16)	
    0x42-0x51	Bank LSB	            Bank MSB (channel 1-16)	
    0x52-0x61	Bank MSB	            Bank LSB (channel 1-16)	
    

<data-active-preset>

    0x00	User
    0x01	Track
    0x02	Transport
    0x03	Track Long Press
    0x04	Transport Long Press

<data-CurUserPreset>

    0x00	1A
    0x01	2A
    0x02	3A
    0x03	4A
    0x04	5A
    0x05	6A
    0x06	1B
    0x07	2B
    0x08	3B
    0x09	4B
    0x0A	5B
    0x0B	6B
    0x0C	1C
    0x0D	2C
    0x0E	3C
    0x0F	4C
    0x10	5C
    0x11	6C
    0x12	1D
    0x13	2D
    0x14	3D
    0x15	4D
    0x16	5D
    0x17	6D


