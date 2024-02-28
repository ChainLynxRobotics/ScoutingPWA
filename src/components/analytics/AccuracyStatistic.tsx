import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";

export default function AccuracyStatistic(props: {name: string, value: number, total: number, desc?: string}) {

    const [infoOpen, setInfoOpen] = useState(false);
    
    return (
        <div>
            <span className="">{props.name}: </span>
            <b className="text-lg">{props.value}/{props.total} </b>
            <span className="text-secondary italic">({Math.round((props.value / props.total) * 100 * 100) / 100}%)</span>
            {props.desc && 
                <>
                    <button onClick={()=>setInfoOpen(true)} className="material-symbols-outlined">info</button>
                    <Dialog 
                        open={infoOpen} 
                        onClose={()=>setInfoOpen(false)}
                        aria-labelledby="info-dialog-title"
                        maxWidth="sm"
                    >
                        <DialogTitle id="info-dialog-title">{props.name} Information</DialogTitle>
                        <DialogContent>
                            <p>{props.desc}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={()=>setInfoOpen(false)}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </>
            }
        </div>
    )
}