create or replace procedure public.sp_update_diff_sx7(p_uuid varchar, p_tabela varchar)
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
								s2.x7_campo = s.x7_campo and 
								s2.x7_sequenc = s.x7_sequenc 
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
								s2.x7_campo = s.x7_campo and 
								s2.x7_sequenc = s.x7_sequenc 
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
								s2.x7_campo = s.x7_campo and 
								s2.x7_sequenc = s.x7_sequenc and
                                (
                                    s.x7_regra   <>   s2.x7_regra   or
                                    s.x7_cdomin  <>   s2.x7_cdomin  or
                                    s.x7_tipo    <>   s2.x7_tipo    or
                                    s.x7_seek    <>   s2.x7_seek    or
                                    s.x7_alias   <>   s2.x7_alias   or
                                    s.x7_ordem   <>   s2.x7_ordem   or
                                    s.x7_chave   <>   s2.x7_chave   or
                                    s.x7_condic  <>   s2.x7_condic  or
                                    s.x7_propri  <>   s2.x7_propri
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
