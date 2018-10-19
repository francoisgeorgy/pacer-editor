# Programming

Data Encoder: select CTRL 
press/move switch/control to edit
Data Encoder: select 

SETUP
    ALL     All steps, one shot
    SEQ     Sequence
    ESS     External Step Select
STEPS
    press switch 2..6 to activate/deactivate
TYPE
    CCTOG   CC toggle
    CCTRG
    CCSTP
    NT
    NTTOG
    PGBNK
    PGSTEP
    NRPNC
    NRPNF
    MMC
    RELAY
    PRESET
    PR-+
    STEP
    STP-+
    OFF
PRG
    0..127
LSB
    0..127
MSB
    0..127
M CHA
    0..16
LED
    MIDI
    ONCLR
    OFCLR
    LEDNM
    BACK
CLEAR
BACK



# Organization

- Global settings
- Presets:
    - 24 presets saved in memory: 
        - banks A..D
        - presets 1..6 within each bank
    - Preset #0 is current preset (in volatile memory)
        
        
## Preset

- Switches:
    - stompswitch A..D    
    - stompswitch 1..6
    - ext. footswitch 1..4
    - ext. expression pedal 1..2

        
For a switch:

- 6 steps
- control mode
- LEDs settings
    - on color
    - off color
    - MIDI control


For a step:

- channel
- message type
- data, 3 bytes
- other





