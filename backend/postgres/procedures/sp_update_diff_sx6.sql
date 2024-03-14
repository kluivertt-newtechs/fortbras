create or replace procedure public.sp_update_diff_sx6(p_uuid varchar, p_tabela varchar)
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
								s2.x6_fil = s.x6_fil and 
								s2.x6_var = s.x6_var 
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
								s2.x6_fil = s.x6_fil and 
								s2.x6_var = s.x6_var 
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
								s2.x6_fil = s.x6_fil and 
								s2.x6_var = s.x6_var and
                                (
                                    s.x6_tipo    <>  s2.x6_tipo    or
                                    s.x6_descric <>  s2.x6_descric or
                                    s.x6_dscspa  <>  s2.x6_dscspa  or
                                    s.x6_dsceng  <>  s2.x6_dsceng  or
                                    s.x6_desc1   <>  s2.x6_desc1   or
                                    s.x6_dscspa1 <>  s2.x6_dscspa1 or
                                    s.x6_dsceng1 <>  s2.x6_dsceng1 or
                                    s.x6_desc2   <>  s2.x6_desc2   or
                                    s.x6_dscspa2 <>  s2.x6_dscspa2 or
                                    s.x6_dsceng2 <>  s2.x6_dsceng2 or
                                    s.x6_conteud <>  s2.x6_conteud or
                                    s.x6_contspa <>  s2.x6_contspa or
                                    s.x6_conteng <>  s2.x6_conteng or
                                    s.x6_propri  <>  s2.x6_propri  or
                                    s.x6_pyme    <>  s2.x6_pyme    or
                                    s.x6_valid   <>  s2.x6_valid   or
                                    s.x6_init    <>  s2.x6_init    or
                                    s.x6_defpor  <>  s2.x6_defpor  or
                                    s.x6_defspa  <>  s2.x6_defspa  or
                                    s.x6_defeng  <>  s2.x6_defeng  or
                                    s.x6_expdest <>  s2.x6_expdest
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
