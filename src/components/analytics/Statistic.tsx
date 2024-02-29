import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";

export type StatisticProps = {
    name: string, 
    desc?: string,
    pl?: string
}

export default function Statistic(props: StatisticProps & {children: React.ReactNode}) {

    const [infoOpen, setInfoOpen] = useState(false);
    
    return (
        <div className="flex items-center gap-2" style={props.pl ? {paddingLeft: props.pl} : undefined}>
            <span className="">{props.name}: </span>
            {props.children}
            {props.desc && 
                <>
                    <a href="#" onClick={()=>setInfoOpen(true)} className="material-symbols-outlined text-secondary text-right">info</a>
                    <Dialog 
                        open={infoOpen} 
                        onClose={()=>setInfoOpen(false)}
                        aria-labelledby="info-dialog-title"
                        maxWidth="sm"
                    >
                        <DialogTitle id="info-dialog-title">Info</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {props.desc}
                            </DialogContentText>
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