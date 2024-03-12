import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";

export type StatisticProps = {
    name: string, 
    desc?: string,
    pl?: string,
    plot?: {
        name: string,
        color: string,
        enabled: boolean,
        setEnabled: (enabled: boolean) => void,
    }
}

export default function Statistic(props: StatisticProps & {children: React.ReactNode}) {

    const [infoOpen, setInfoOpen] = useState(false);
    
    return (
        <div className="flex items-center gap-2" style={props.pl ? {paddingLeft: props.pl} : undefined}>
            <span className="-indent-2 pl-2">{props.name}: </span>
            {props.children}

            {props.plot && (
                props.plot.enabled ?
                    <a href="#" onClick={()=>props.plot?.setEnabled(false)} className="material-symbols-outlined" style={{color: props.plot.color}}>query_stats</a>
                    :
                    <a href="#" onClick={()=>props.plot?.setEnabled(true)} className="material-symbols-outlined text-secondary">query_stats</a>
            )}
            
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