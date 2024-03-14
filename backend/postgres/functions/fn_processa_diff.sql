-- DROP FUNCTION public.fn_processa_diff();

CREATE OR REPLACE FUNCTION public.fn_processa_diff()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
       v_query_select_dict_1 varchar;
       v_query_diff varchar;
       reg record;
       reg2 record;
       diff_count int := 0;
      _rows int := 0;
begin
	
    if new.status = 1 then
        v_query_select_dict_1 := 'select * from queue where uuid = $1 and tabela = $2 and dict <> $3 and status = 1';
        execute v_query_select_dict_1 into reg2 using new.uuid, new.tabela, new.dict;
        get diagnostics _rows = row_count;
        if _rows > 0 then
            call public.sp_update_diff(new.uuid, new.tabela);
        elseif _rows = 0 then
            call public.sp_update_diff(new.uuid, new.tabela);
        end if;
    end if;
	
	return new;
end;
$function$
;
