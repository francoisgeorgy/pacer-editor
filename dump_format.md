
| <cmd> | <tgt>         | <idx> | <obj> | <elm> | <data> | Meaning | Note                     |
|-------|---------------|-------|-------|-------|--------|---------|--------------------------|
| 0x01  | See tab <tgt> |       |       |       |        | Set     | Set value on PACER       |
| 0x02  |               |       |       |       |        | Get     | Request value from Pacer |


Control-<elm>

| <cmd> | <tgt> | <idx> | <obj> | <elm>     | <data>                        | Meaning                    |
|-------|-------|-------|-------|-----------|-------------------------------|----------------------------|
|       |       |       |       | 0x01      | Start from <data>-MessageType | Step 1: Channel            |
|       |       |       |       | 0x02      |                               | Step 1: Message Type       |
|       |       |       |       | 0x03      |                               | Step 1: Data 1             |
|       |       |       |       | 0x04      |                               | Step 1: Data 2             |
|       |       |       |       | 0x05      |                               | Step 1: Data 3             |
|       |       |       |       | 0x06      |                               | Step 1: Step Active        |
|       |       |       |       | 0x07-0x0C |                               | Step 2 values              |
|       |       |       |       | 0x0D-0x12 |                               | Step 3 values              |
|       |       |       |       | 0x13-0x18 |                               | Step 4 values              |
|       |       |       |       | 0x19-0x1E |                               | Step 5 values              |
|       |       |       |       | 0x1F-0x24 |                               | Step 6 values              |
|       |       |       |       | 0x40      | <data>-MIDICtrl               | Step 1: LED MIDI Ctrl      |
|       |       |       |       | 0x41      | <data>-Color                  | Step 1: LED Active Color   |
|       |       |       |       | 0x42      | <data>-Color                  | Step 1: LED Inactive Color |
|       |       |       |       | 0x43      | <data>-LEDNum                 | Step 1: LED num            |
|       |       |       |       | 0x44-0x47 | See Step 1                    | Step 2 LED values          |


<data>-Color

| Value | Meaning           |
|-------|-------------------|
| 0x00  | Off               |
| 0x01  | 1A--Pink          |
| 0x02  | 1B--Dim Pink      |
| 0x03  | 2A--Red           |
| 0x04  | 2B--Dim Red       |
| 0x05  | 3A--Orange        |
| 0x06  | 3B--Dim Orange    |
| 0x07  | 4A--Amber         |
| 0x08  | 4B--Dim Amber     |
| 0x09  | 5A--Yellow        |
| 0x0A  | 5B--Dim Yellow    |
| 0x0B  | 6A--Lime          |
| 0x0C  | 6B--Dim Lime      |
| 0x0D  | 7A--Green         |
| 0x0E  | 7B--Dim Green     |
| 0x0F  | 8A--Teal          |
| 0x10  | 8B--Dim Teal      |
| 0x11  | 9A--Blue          |
| 0x12  | 9B--Dim Blue      |
| 0x13  | 10A--Lavender     |
| 0x14  | 10B--Dim Lavender |
| 0x15  | 11A--Purple       |
| 0x16  | 11B--Dim Purple   |
| 0x17  | 12A--White        |
| 0x18  | 12B--Dim White    |


<data>-LEDNum

| Value | Meaning |
|-------|---------|
| 0x00  | Default |
| 0x01  | Bottom  |
| 0x02  | Middle  |
| 0x03  | Top     |
