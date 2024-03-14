create or replace procedure public.sp_update_diff_sxa(p_uuid varchar, p_tabela varchar)
language plpgsql
as $$
declare
       v_query_select_dict_1 varchar;
       v_query_diff varchar;
       reg record;
       reg_diff record;
       diff_count int := 0;
      _rows int := 0;

begin

    -- Marca registros que existe no dicionário 1, mas não existem no dicionário 2
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 2 and	
								s2.xa_alias = s.xa_alias and 
								s2.xa_ordem = s.xa_ordem 
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 1 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existe no dicionário 2, mas não existem no dicionário 1
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 1 and	
								s2.xa_alias = s.xa_alias and 
								s2.xa_ordem = s.xa_ordem 
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 2 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existem dos dois dicionários, mas possuem diferenças
	v_query_select_dict_1 := 'select s.id, s2.id as id_diff from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
							(
								s2.xa_alias = s.xa_alias and 
								s2.xa_ordem = s.xa_ordem and
                                (
                                    s.xa_descric  <>   s2.xa_descric or
                                    s.xa_descspa  <>   s2.xa_descspa or
                                    s.xa_desceng  <>   s2.xa_desceng or
                                    s.xa_propri   <>   s2.xa_propri  or
                                    s.xa_agrup    <>   s2.xa_agrup   or
                                    s.xa_tipo     <>   s2.xa_tipo
                                )
							)
							where s.uuid = ''' || p_uuid || ''' and s.dict = 1 and s2.id is not null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id, diff_count;	                	
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id_diff, diff_count;
		
	end loop;
end 
$$;
