import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"


interface DocumentProps{
    id:string,
    name:string,
    setOpenDocument: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveDocument:(id:string)=> void
    checkRoot:boolean
    selectDocument:string[]
    setSelectDocument: React.Dispatch<React.SetStateAction<string[]>>;

}

export function Document({id,name,setOpenDocument, setActiveDocument,checkRoot, selectDocument,setSelectDocument}:DocumentProps){
    const [isChecked, setIsChecked] = useState(false);

    const handleCheck = (checked:boolean)=>{
        setIsChecked(checked)
        if(checked){
            setSelectDocument((prev: string[]) => [...prev, id]);
        }else{
            if(selectDocument.includes(id)){
                setSelectDocument(selectDocument.filter((item)=>item!==id))
            }
        }
        

    }
    const handleClick = () => {
        setOpenDocument(true)
        setActiveDocument(id)
    };

    useEffect(()=>{
        if(checkRoot){
            setIsChecked(false)
        }
    },[checkRoot])

    return(
        <>
        <div className="flex items-center">
            <Checkbox checked={isChecked} onCheckedChange={handleCheck} className="ml-2" key={id} />
            <Button  variant="ghost"
                className="w-full rounded-none h-auto break-words"
                onClick={handleClick}
                style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                {name}
            </Button>
        </div>
        <Separator/>
        </>
    )

}